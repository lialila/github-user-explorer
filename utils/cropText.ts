const cropText = (text: string, maxLength: number): string =>
  text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

export default cropText;
