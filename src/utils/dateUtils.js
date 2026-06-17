

const LastActive = ({ timestamp }) => {
    if (!timestamp) return ;
    const now = new Date();

  const past = new Date(timestamp);
  const diff = (now - past) / 1000; // seconds

  if (diff < 60) return "just now";
  if (diff < 3600) return `Active ${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `Active ${Math.floor(diff / 3600)} hrs ago`;
  if (diff < 172800) return "Active yesterday";
  if (diff < 604800) return `Active ${Math.floor(diff / 86400)} days ago`

  return `Active long ago`;
};

const getDateLabel = ({date}) =>{
  const today = new Date();
  const msgDate = new Date(date);

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const startOfMsgDay = new Date(
    msgDate.getFullYear(),
    msgDate.getMonth(),
    msgDate.getDate()
  )

  const diff = (startOfToday - startOfMsgDay) / (1000 * 60 * 60 * 24);

  if (diff < 1) return "Today";
  if (diff < 2) return "Yesterday";

  if (diff < 7) return msgDate.toLocaleDateString("en-US", {
    weekday: "short"
  });
 // Same year
  if (today.getFullYear() === msgDate.getFullYear()) {
    return msgDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  // Different year
  return msgDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

}

const getTimeLabel = ({date}) =>{
  const msgDate = new Date(date);
  return msgDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

export { LastActive, getDateLabel, getTimeLabel };