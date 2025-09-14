import generalQueries from "./queries/generalQueries";
import userQueries from "./queries/userQueries";

let queries : any = {
    ...generalQueries,
    ...userQueries
}

export default queries