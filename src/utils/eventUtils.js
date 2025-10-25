export const checkEventStatus = (event, currentTime) => {
  const now = currentTime || new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDate = new Date(`${event.date}T00:00:00`);

  const isToday = eventDate.getTime() === today.getTime();

  let isHappeningNow = false;
  let hasEnded = false;

  if (event.time) {
    const eventStartDateTime = new Date(`${event.date}T${event.time}`);
    let eventEndDateTime;

    if (event.endTime) {
      eventEndDateTime = new Date(`${event.date}T${event.endTime}`);
    } else {
      // If no end time, assume it lasts for 1 hour
      eventEndDateTime = new Date(eventStartDateTime.getTime() + 60 * 60 * 1000);
    }

    if (now >= eventStartDateTime && now <= eventEndDateTime) {
      isHappeningNow = true;
    } else if (now > eventEndDateTime) { // Event has passed
      hasEnded = true;
    } else {
      // Event is today but hasn't started yet, so it's upcoming.
      hasEnded = false;
    }
  } else {
    // If no time, it hasn't ended if it's today or in the future
    hasEnded = eventDate < today;
  }

  return {
    isToday,
    isHappeningNow,
    hasEnded,
  };
};