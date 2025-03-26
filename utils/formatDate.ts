const formatDate = (date: Date): string => {
  const dateObj = new Date(date);
  return `${dateObj.toLocaleString("en", {
    month: "short",
  })} ${dateObj.getDate()} ${dateObj.getFullYear()}`;
};

export default formatDate;
