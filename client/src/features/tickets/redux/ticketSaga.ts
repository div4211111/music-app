import { PayloadAction } from "@reduxjs/toolkit";
import axios, { CancelTokenSource } from "axios";
import { SagaIterator } from "redux-saga";
import {
  call,
  cancel,
  cancelled,
  put,
  race,
  select,
  take,
  takeEvery,
} from "redux-saga/effects";

import { Reservation } from "../../../../../shared/types";
import { showToast } from "../../toast/redux/toastSlice";
import { ToastOptions } from "../../toast/types";
import {
  cancelPurchaseServerCall,
  releaseServerCall,
  reserveTicketServerCall,
} from "../api";
import { TicketAction } from "../types";
import {
  endTransaction,
  holdTickets,
  PurchasePayload,
  ReleasePayload,
  resetTransaction,
  selectors,
  startTicketAbort,
  startTicketPurchase,
  startTicketRelease,
} from "./ticketSlice";

export function generateErrorToastOptions(
  error: string,
  ticketAction: TicketAction
): ToastOptions {
  const titleIntro = ticketAction
    ? `Could not ${ticketAction} tickets`
    : "Ticket error";
  return {
    title: `${titleIntro}: ${error}`,
    status: "error",
  };
}

function* releaseTickets(payload: ReleasePayload): SagaIterator {
  const { reservation, reason } = payload;
  yield put(showToast({ title: reason, status: "warning" }));
  yield call(cancelTransaction, reservation);
}

function* cancelTransaction(holdReservation: Reservation): SagaIterator {
  yield call(releaseServerCall, holdReservation);
  yield put(resetTransaction());
}

export function* purchaseTickets(
  payload: PurchasePayload,
  cancelSource: CancelTokenSource
): SagaIterator {
  const { purchaseReservation, holdReservation } = payload;
  try {
    const { abort, purchaseResult } = yield race({
      purchaseResult: call(
        reserveTicketServerCall,
        purchaseReservation,
        cancelSource.token
      ),
      abort: take(startTicketAbort.type),
    });
    if (abort) {
      yield call(cancelSource.cancel);
      yield cancel();
    } else if (purchaseResult) {
      const ticketAction = yield select(selectors.getTicketAction);
      const errorToastOptions = yield call(
        generateErrorToastOptions,
        purchaseResult,
        ticketAction
      );
      yield put(showToast(errorToastOptions));
      yield call(cancelTransaction, holdReservation);
    } else {
      yield put(showToast({ title: "tickets purchased", status: "success" }));
    }
  } finally {
    if (yield cancelled()) {
      yield call(cancelPurchaseServerCall, purchaseReservation);
      yield put(showToast({ title: "purchase canceled", status: "warning" }));
      yield call(cancelTransaction, holdReservation);
    } else {
      yield call(releaseServerCall, holdReservation);
      yield put(endTransaction());
    }
  }
}

export function* ticketFlow({
  payload: holdPayload,
}: PayloadAction<Reservation>): SagaIterator {
  try {
    yield call(reserveTicketServerCall, holdPayload);
    const nextAction = yield take([
      startTicketRelease.type,
      startTicketAbort.type,
      startTicketPurchase.type,
    ]);
    if (nextAction.type === startTicketPurchase.type) {
      const cancelSource = axios.CancelToken.source();
      yield call(purchaseTickets, nextAction.payload, cancelSource);
    } else {
      yield call(releaseTickets, nextAction.payload);
    }
  } catch (error) {
    const ticketAction = yield select(selectors.getTicketAction);

    const errorToastOptions = yield call(
      generateErrorToastOptions,
      error.toString(),
      ticketAction
    );
    yield put(showToast(errorToastOptions));
    yield call(cancelTransaction, holdPayload);
  }
}

export function* watchTicketHolds(): SagaIterator {
  yield takeEvery(holdTickets.type, ticketFlow);
}
