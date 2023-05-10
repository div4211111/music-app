import { all } from "redux-saga/effects";

import { signInFlow } from "../../../features/auth/redux/signInSaga";
import { watchTicketHolds } from "../../../features/tickets/redux/ticketSaga";

export function* rootSaga() {
  yield all([signInFlow(), watchTicketHolds()]);
}
