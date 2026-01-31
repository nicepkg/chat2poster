import { defaultLocale } from "@chat2poster/shared-ui/i18n/core";
import { redirect } from "next/navigation";

export default function RootRedirect() {
  redirect(`/${defaultLocale}`);
}
