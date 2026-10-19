export type Who = 'took' | 'specific' | 'web' | 'unassigned';
export type Unit = 'minutes' | 'hours' | 'days';

export interface Rule {
  key: string;
  title: string;
  use: string;
  /** "Right now" line + the text repeated in the first column */
  now: string;
  /** undefined = "Created automatically" column; otherwise "Create the task after waiting" */
  wait?: { value: number; unit: Unit; text: string };
  finish: number;
  finishNote: string;
  importance: 'Low' | 'Medium' | 'High' | 'Urgent';
  who: Who;
  whoNote: string;
  example: string;
  skipPaid?: boolean;
}

/** TODO: API — load/save these per business. Every rule starts switched off. */
export const RULES: Rule[] = [
  {
    key: 'pending_return', title: 'Pending return',
    use: 'Use this when a return has started (customer or courier began it) but the order is not finally Returned yet.',
    now: "A task is created as soon as an approved order's status becomes Pending_Return. No waiting time needed.",
    finish: 60, finishNote: 'Set how quickly the staff member should call the customer or courier after the task is created.',
    importance: 'High', who: 'took', whoNote: 'Best choice: the person who originally took the order, so they handle their own return follow-up.',
    skipPaid: true, example: 'An order becomes Pending_Return → the staff member gets a task within a few minutes.',
  },
  {
    key: 'returned', title: 'Returned order',
    use: "Use this for orders that are finally Returned and need review — the customer's reason, a courier issue, or the next step.",
    now: "A task is created as soon as an approved order's status becomes Returned. No waiting time needed.",
    finish: 120, finishNote: 'Set how much time the staff member gets to review the return and finish the task.',
    importance: 'High', who: 'took', whoNote: 'Best choice: the person who originally took the order. If that person is inactive, it goes to the unassigned list for an admin to hand out.',
    example: 'An order becomes Returned → the staff member reviews the reason, notes, courier charge, and decides the next step.',
  },
  {
    key: 'shipped_long', title: 'Shipped too long',
    use: 'Use this when an order has stayed Shipped longer than your courier should take to deliver.',
    now: 'A task is created only after the order has been Shipped for longer than the time you set below.',
    wait: { value: 3, unit: 'days', text: 'Example: 3 days means the order has been Shipped for more than 3 days — counted from when it became Shipped, not from when the order was placed.' },
    finish: 240, finishNote: 'Set how soon to follow up after the delay task is created.',
    importance: 'High', who: 'took', whoNote: 'Best choice: the person who took the order, unless your business has someone who handles delivery/logistics.',
    example: 'Shipped on Monday with a 3-day wait → if it is still Shipped after Thursday, a task is created.',
  },
  {
    key: 'callback', title: 'Customer callback',
    use: "Use this for callbacks the customer asked for — like 'call me tomorrow' or 'call after 3 days'.",
    now: 'The task is scheduled for the callback date/time the customer asked for. No waiting time needed here.',
    finish: 0, finishNote: 'Use the callback time as the deadline, or keep it immediate so the follow-up happens right on time.',
    importance: 'Medium', who: 'specific', whoNote: 'Best choice: a selected staff member — usually the person who promised the callback.',
    example: 'Customer asks for a call after 3 days → the staff member gets the task on that scheduled date.',
  },
  {
    key: 'web_delay', title: 'Web order delay',
    use: 'Use this when a new web order sits too long without being approved or cancelled.',
    now: 'A task is created after the web order has stayed open (not approved or cancelled) for the time you set below.',
    wait: { value: 30, unit: 'minutes', text: 'Example: 30 minutes means if nobody approves or cancels the web order within 30 minutes, it becomes a task.' },
    finish: 30, finishNote: 'Set how quickly the assigned staff member should call, approve, or cancel once the delay is noticed.',
    importance: 'Medium', who: 'web', whoNote: 'Best choice: the web order assignee. If there is none, it goes to the unassigned list.',
    example: 'A website order comes in at 10:00 with a 30-minute wait → if it is still open, a task is created around 10:30.',
  },
  {
    key: 'rts_not_sent', title: 'RTS not sent',
    use: 'Use this when an order is RTS (Ready To Ship) but has not been sent or uploaded to the courier yet.',
    now: 'A task is created when the order has stayed RTS for the time you set below and still has no send-to-courier time.',
    wait: { value: 4, unit: 'hours', text: 'Example: 4 hours means the order has been RTS for 4 hours but still has not been sent to the courier.' },
    finish: 120, finishNote: 'Set how quickly the staff member should send it to the courier or explain what is blocking it.',
    importance: 'High', who: 'took', whoNote: 'Best choice: the person who took the order — or the unassigned list if logistics/admin should hand it out.',
    example: 'An order becomes RTS at 11:00 with a 4-hour wait → if it is not sent to the courier by 3:00, a task is created.',
  },
  {
    key: 'courier_hold', title: 'Courier hold',
    use: 'Use this when courier tracking shows a parcel is on hold or stuck (often a Shipped or Pending_Return order).',
    now: 'A task is created after the courier shows a hold status for the time you set below.',
    wait: { value: 12, unit: 'hours', text: 'Set a longer wait if couriers usually clear holds on their own; set a shorter wait if you want to follow up quickly.' },
    finish: 120, finishNote: 'Set how quickly the staff member should contact the courier or customer once the hold is noticed.',
    importance: 'High', who: 'took', whoNote: 'Best choice: the person who took the order, unless someone handles courier support.',
    example: 'Courier tracking shows Hold for 24 hours → the staff member gets a courier follow-up task.',
  },
  {
    key: 'pathao_return', title: 'Pathao return requested',
    use: 'Use this when Pathao marks a parcel as return requested and your team must decide whether to reattempt delivery or accept the return.',
    now: 'Every 5 minutes EcomDrive checks active Pathao delivery methods with saved merchant-panel email/password and creates a task for new actionable return requests.',
    finish: 60, finishNote: 'Set how quickly the staff member should review the customer reason and submit Reattempt or Return Accept.',
    importance: 'Urgent', who: 'took', whoNote: 'Best choice: the person who originally took the order. If the order cannot be matched, it goes to the selected employee or unassigned list.',
    example: 'Pathao shows a new return request → the staff member gets a Work Inbox task and can submit Reattempt from EcomDrive.',
  },
  {
    key: 'steadfast_cancel', title: 'Steadfast cancel requested',
    use: 'Use this when Steadfast shows a pending cancel request and your team must decide whether to resend the parcel or confirm cancellation.',
    now: 'Every 5 minutes EcomDrive checks active Steadfast delivery methods with saved email/password and creates a task for new pending cancel requests.',
    finish: 60, finishNote: 'Set how quickly the staff member should review the parcel and submit Request to Resend or Confirm Cancel.',
    importance: 'Urgent', who: 'took', whoNote: 'Best choice: the person who originally took the order. If the order cannot be matched, it goes to the selected employee or unassigned list.',
    example: 'Steadfast shows a pending cancel request → the staff member gets a Work Inbox task and can submit Request to Resend from EcomDrive.',
  },
  {
    key: 'steadfast_lost', title: 'Steadfast parcel lost or damaged',
    use: 'Use this when Steadfast loses or damages a parcel. Steadfast calls it exceptional; EcomDrive never moves the order for it, so a person must decide.',
    now: "Steadfast's webhook says the parcel is exceptional. The order stays where it is and this task is created.",
    finish: 60, finishNote: 'Set how quickly the staff member should claim the parcel with Steadfast and set the order status.',
    importance: 'Urgent', who: 'took', whoNote: 'Best choice: the person who originally took the order.',
    example: 'Steadfast marks a parcel exceptional → the staff member gets an urgent task with the consignment id, files the claim, then sets the order Returned or Cancelled.',
  },
  {
    key: 'steadfast_resent', title: 'Steadfast parcel resent',
    use: 'Use this when Steadfast sends a failed parcel out again instead of returning it, while your order still says it is coming back.',
    now: 'Steadfast writes the resend on the parcel timeline and nowhere else. This rule finds orders sitting in Pending Return or Returned whose parcel was resent for delivery.',
    finish: 120, finishNote: 'Set how quickly somebody should find out what the parcel actually did, before it is restocked or the sale is written off.',
    importance: 'High', who: 'took', whoNote: 'Best choice: the person who originally took the order.',
    example: 'Delivery failed, the order moved to Pending Return, then Steadfast resent the parcel and delivered it → you get a task instead of waiting for stock that is never coming back.',
  },
];
