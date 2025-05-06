import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Chatbot from "../Chatbot";

// Mock useToast
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe("Chatbot Component", () => {
  const onClassroomUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the chatbot toggle button", () => {
    render(<Chatbot onClassroomUpdate={onClassroomUpdate} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("opens and closes the chatbot popup", () => {
    render(<Chatbot onClassroomUpdate={onClassroomUpdate} />);
    const toggleBtn = screen.getByRole("button");
    fireEvent.click(toggleBtn);
    expect(screen.getByText(/Tallyrus Assistant/i)).toBeInTheDocument();
    // Close
    fireEvent.click(screen.getByLabelText(/close/i));
    expect(screen.queryByText(/Tallyrus Assistant/i)).not.toBeVisible();
  });

  it("renders input and send button", () => {
    render(<Chatbot onClassroomUpdate={onClassroomUpdate} />);
    fireEvent.click(screen.getByRole("button"));
    expect(
      screen.getByPlaceholderText(/Type your message/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("shows user and assistant messages", async () => {
    // Mock fetch
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ chatResponse: "Hello from assistant!" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    render(<Chatbot onClassroomUpdate={onClassroomUpdate} />);
    fireEvent.click(screen.getByRole("button"));
    const input = screen.getByPlaceholderText(/Type your message/i);
    fireEvent.change(input, { target: { value: "Hi bot" } });
    fireEvent.submit(input.closest("form"));

    await waitFor(() => {
      expect(screen.getByText("Hi bot")).toBeInTheDocument();
      expect(screen.getByText("Hello from assistant!")).toBeInTheDocument();
    });
  });

  it("shows loading indicator when sending", async () => {
    global.fetch = jest.fn(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ chatResponse: "Delayed response" }),
              }),
            100
          )
        )
    );
    render(<Chatbot onClassroomUpdate={onClassroomUpdate} />);
    fireEvent.click(screen.getByRole("button"));
    const input = screen.getByPlaceholderText(/Type your message/i);
    fireEvent.change(input, { target: { value: "Loading test" } });
    fireEvent.submit(input.closest("form"));
    expect(screen.getByText(/thinking/i)).toBeInTheDocument();
  });

  it("shows error toast on error", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ chatResponse: "Failed to get response" }),
    });
    render(<Chatbot onClassroomUpdate={onClassroomUpdate} />);
    fireEvent.click(screen.getByRole("button"));
    const input = screen.getByPlaceholderText(/Type your message/i);
    fireEvent.change(input, { target: { value: "Error test" } });
    fireEvent.submit(input.closest("form"));
    await waitFor(() => {
      expect(screen.getByText(/Failed to get response/i)).toBeInTheDocument();
    });
  });
});
