import { Event } from "../structures/Event";
import User from "../structures/mongodb/User";

export default new Event('ready', async (client) => {
    console.log("Trashcat is online.");
    
    // Queue up reminders that any user currently has.
    const users = await User.find();
    users.forEach(async user => {
        // Stop if they don't have any reminders.
        if (!user.reminders) return;
        const reminders: Array<[number, string]> = JSON.parse(user.reminders);
        if (!reminders) return;
        
        // Sanity check their member id.
        const memberId: string | undefined = user.memberId;
        if (memberId == undefined) return;
        
        // Sanity check their member object.
        const member = await client.users.fetch(memberId);
        if (member == undefined) return;

        // Iterate each reminder to see if we need to start it up again.
        reminders.forEach(async (reminderStruct: [number, string]) => {
            // Grab the timestamp and reminder from the array.
            const timestamp: number = reminderStruct[0];
            const reminder: string = reminderStruct[1];

            // Subtract the current time from the timestamp to see
            // how much time is remaining for the reminder.
            const timeRemaining: number = timestamp - Date.now();

            // Don't send the reminder if we were offline while it happened.
            if (timeRemaining < 0) {
                user.reminders = JSON.stringify(reminders.filter(r => r != reminderStruct));
                await user.save();
                return;
            }

            // Otherwise, once again set up a timeout which will fire once time's up.
            setTimeout(async () => {
                await member.send(`Hey, I'm reminding you about this: **${reminder}**`);
                user.reminders = JSON.stringify(reminders.filter(r => r != reminderStruct));
                await user.save();
            }, timeRemaining);
        });
    });
});
