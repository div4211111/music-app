import dayjs from "dayjs";

import {
  fireEvent,
  getByRole,
  getByText,
  render,
  screen,
} from "../../../test-utils";
import { Shows } from "./Shows";

test("displays relevant show details for non-sold-out show", async () => {
  render(<Shows />);
  const shows = await screen.findAllByRole("listitem");
  const notSoldOutShow = shows[0];

  expect(
    getByRole(notSoldOutShow, "button", { name: /tickets/i })
  ).toBeInTheDocument();
  expect(getByText(notSoldOutShow, /avalanche of cheese/i)).toBeInTheDocument();
  expect(
    getByText(notSoldOutShow, /rollicking country with ambitious kazoo solos/i)
  );
  expect(
    getByText(
      notSoldOutShow,
      dayjs().add(1, "days").format("YYYY MMM D").toLowerCase()
    )
  ).toBeInTheDocument();
});

test("displays relevant show details for sold-out show", async () => {
  render(<Shows />);
  const shows = await screen.findAllByRole("listitem");
  const soldOutShow = shows[1];

  expect(getByText(soldOutShow, /sold out/i)).toBeInTheDocument();
  expect(getByText(soldOutShow, /the joyous nun riot/i)).toBeInTheDocument();
  expect(
    getByText(soldOutShow, /serious a capella with an iconic musical saw/i)
  );
  expect(
    getByText(
      soldOutShow,
      dayjs().add(2, "days").format("YYYY MMM D").toLowerCase()
    )
  ).toBeInTheDocument();
});

test("redirects to correct tickets URL when 'buy tickets' is clicked", async () => {
  const { history } = render(<Shows />);

  const ticketsButton = await screen.findByRole("button", { name: /tickets/i });
  fireEvent.click(ticketsButton);

  expect(history.location.pathname).toBe("/tickets/0");
});
