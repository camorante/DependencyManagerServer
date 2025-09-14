import generalMutations from "./mutations/generalMutations";
import userMutations from "./mutations/userMutations";
let mutations : any = {
    ...generalMutations,
    ...userMutations
}

export default mutations