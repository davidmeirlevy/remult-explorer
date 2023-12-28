import { Entity, Fields, Validators } from "remult";

@Entity("people", { allowApiCrud: true })
export class Person {
  @Fields.cuid()
  id = "";
  @Fields.string({ validate: Validators.required })
  firstName = "";
  @Fields.string()
  lastName = "";
}
