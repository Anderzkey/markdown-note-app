# CSS Grid Mastery

Create powerful layouts with CSS Grid.

## Basic Grid Setup

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
```

## Grid Areas

Define named areas for complex layouts:

```css
grid-area: header;
grid-area: sidebar;
grid-area: main;
```
