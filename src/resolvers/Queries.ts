import generalQueries from "./queries/generalQueries";
import userQueries from "./queries/userQueries";
import dependencyQueries from "./queries/dependencyQueries";

let queries : any = {
    ...generalQueries,
    ...userQueries,
    ...dependencyQueries
}

export default queries