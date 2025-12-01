

const LastActive = ({ timestamp }) => {
    if (!timestamp) return ;
    const now = new Date();

  const past = new Date(timestamp);
  const diff = (now - past) / 1000; // seconds

  if (diff < 60) return "just now";
  if (diff < 3600) return `Active ${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `Active ${Math.floor(diff / 3600)} hrs ago`;

  return `${Math.floor(diff / 86400)} days ago`;
};

export default LastActive;