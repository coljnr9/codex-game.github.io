# Repository Development Guide

This project hosts a lightweight 3D canvas demo for the Codex Game GitHub Pages site. The code should remain easy to understand and free from unnecessary dependencies so contributors can quickly experiment with WebGL and WebGPU techniques.

## Development

The following practices help keep the demo stable and maintainable:

* **Modern JavaScript** – Always use `let` and `const` instead of `var`. Prefer ES modules and arrow functions where appropriate.
* **Minimal dependencies** – The demo should load quickly. Avoid pulling in large frameworks or heavy assets.
* **Small, focused functions** – Break logic into testable pieces. Keep each function short and give it a single responsibility.
* **Cross-browser compatibility** – Verify that any new Web APIs are widely supported before using them. Include fallbacks when practical.
* **Clear documentation** – Annotate complex sections with comments and keep variable names descriptive. This helps future contributors quickly understand the code.
* **Testing** – Run `npm test` before committing. Add new tests for any bug fix or feature. Tests use Node's built-in test runner and should remain fast.

## Pull Requests

Contributors should follow these steps when submitting a PR:

1. Provide a concise summary of the change: what it does and why it is needed.
2. Reference related issues when relevant.
3. Include the output of `npm test` in the PR body to show the code still passes all tests.
4. Keep commits small and use imperative commit messages (for example, "Add water ripple effect" rather than "Added water ripple effect").
5. Wait for CI results before merging and address any review feedback promptly.

These guidelines help ensure the project remains battle-tested and easy for others to build upon.
