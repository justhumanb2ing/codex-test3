import { redirect } from "next/navigation"

export default function NewReadingEntryPage() {
  redirect("/reading?compose=new")
}
