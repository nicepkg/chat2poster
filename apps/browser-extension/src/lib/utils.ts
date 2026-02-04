import { CHAT2POSTER_COMPONENT_NAME } from "~/constants/extension-runtime";

export const getChat2posterBodyNode = () => {
  const chat2poster = window?.top?.document.querySelector(
    CHAT2POSTER_COMPONENT_NAME,
  );

  if (chat2poster?.shadowRoot) {
    const body = chat2poster.shadowRoot.querySelector("body");
    return body;
  }

  return null;
};
