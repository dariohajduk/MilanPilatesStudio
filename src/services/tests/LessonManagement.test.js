import { render } from "@testing-library/react";
import LessonManagement from "../../../../pages/LessonManagement";

test("renders LessonManagement with lessons", () => {
    render(<LessonManagement />);
    expect(screen.getByText(/ניהול שיעורים/i)).toBeInTheDocument();
});