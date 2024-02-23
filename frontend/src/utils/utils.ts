export const isMermaidChart = (text: string): boolean => {
  // Check if the text starts with - MERMAID -
  return text.startsWith("- MERMAID -");
};

export const cleanInputText = (text: string): string => {
  // Remove the - MERMAID - tag
  return text.replace("- MERMAID -", "").replace("- TEXT -", "");
};
