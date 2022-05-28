## Architecture

- Listener for `selectionchange` => if the selection is not empty then render the highlight button using absolute coordinates
- Click of button => Call `doHighlight` on the user's _active highlighter_
  - Disable all events on user highlighters
- A highlight creates a highlight node with no comment nodes. A highlight node w/ no comment nodes results in a make comment icon

We are going to use

### Overlapping highlights?

- Can we hack this stuff?
  - Split selection text into tuples
  - Find what occurrence this is of the selection text
  -
- In the pre-process step, parse the HTML
