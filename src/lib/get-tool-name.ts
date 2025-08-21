export const getToolDisplayName = (message: any) => {
  if (Array.isArray(message.parts)) {
    const toolPart = message.parts.find((part: any) =>
      part.type?.startsWith("tool-")
    );
    if (toolPart) {
      const toolName = toolPart.type.replace("tool-", "");
      if (toolName.includes("routine")) {
        return "Generating Routine... (Normally takes 1 minute)";
      } else if (toolName.includes("send_mail")) {
        return "Sending Mail...";
      }
      return `Using ${toolName}`;
    }
  }
  return "Processing";
};

export const getToolTextLoop = (message: any) => {
  if (Array.isArray(message.parts)) {
    const toolPart = message.parts.find((part: any) =>
      part.type?.startsWith("tool-")
    );
    if (toolPart) {
      const toolName = toolPart.type.replace("tool-", "");
      
      if (toolName.includes("routine") || toolName.includes("plan_and_send")) {
        return [
          "Understanding your skin pattern...",
          "Analyzing your preferences...",
          "Generating personalized routine...",
          "Finding products that suit your skin...",
          "Building your skincare plan...",
          "Almost done..."
        ];
      } else if (toolName.includes("send_mail")) {
        return [
          "Preparing your email...",
          "Sending your routine...",
          "Almost done..."
        ];
      } else if (toolName.includes("detect_skin")) {
        return [
          "Analyzing your skin image...",
          "Detecting skin type...",
          "Processing results..."
        ];
      } else if (toolName.includes("product_search")) {
        return [
          "Searching for products...",
          "Filtering by your criteria...",
          "Finding the best matches..."
        ];
      }
      
      return [`Using ${toolName}...`];
    }
  }
  return ["Processing..."];
};
