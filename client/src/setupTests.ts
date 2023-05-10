import "@testing-library/jest-dom/extend-expect";

import { server } from "./mocks/server";

beforeAll(() => {
  const { getComputedStyle } = window;
  window.getComputedStyle = (elt) => getComputedStyle(elt);

  server.listen();
});

afterEach(() => server.resetHandlers());

afterAll(() => server.close());
