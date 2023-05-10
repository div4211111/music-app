import { App } from "../../../App";
import { fireEvent, render, screen } from "../../../test-utils";

test("tickets page displays band data for showId", async () => {
  render(<App />, {
    preloadedState: { user: { userDetails: { email: "test@test.com" } } },
    routeHistory: ["/tickets/0"],
  });
  const heading = await screen.findByRole("heading", {
    name: "Avalanche of Cheese",
  });
  expect(heading).toBeInTheDocument();

});

test("'ticket' button click pushes correct URL", async () => {
  const { history } = render(<App />, {
    routeHistory: ["/tickets/0"],
    preloadedState: { user: { userDetails: { email: "test@test.com" } } },
  });

  const purchaseButton = await screen.findByRole("button", {
    name: /purchase/i,
  });
  fireEvent.click(purchaseButton);

  expect(history.location.pathname).toEqual("/confirm/0");

  const searchRegex = expect.stringMatching(/holdId=\d+&seatCount=2/);
  expect(history.location.search).toEqual(searchRegex);
});
