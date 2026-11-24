# matrix-rain

A Claude Code mod that puts falling green code rain behind the conversation, with depth. Three layers of columns drift down at different speeds: the far layer is small, slow and dim, the near layer large, faster and bright, so the columns seem to pass in front of each other. It also sets a black theme with light green text. It draws in the Claude desktop and mobile apps; the terminal draws no backdrop.

## Install

At the prompt of a terminal session:

```
/plugin install matrix-rain --marketplace GusMenn/matrix-rain
```

Answer `y` to add the marketplace, then pick a scope (user scope loads it in every session).

From a shell:

```
claude plugin install matrix-rain --marketplace GusMenn/matrix-rain
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `GusMenn/matrix-rain`, then Add plugin.

## Notes

- Speeds are kept under the app's flashing limit (about three glyphs crossing a point per second); faster rain gets held still by the app.
- If you run another mod that sets a backdrop, only the last one applied shows: disable the other.

## License

MIT
