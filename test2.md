# React Hooks Guide

Hooks allow you to use state and other React features.

## useState

The most common hook for managing component state:

```jsx
const [count, setCount] = useState(0);
```

## useEffect

Side effects in functional components:

```jsx
useEffect(() => {
  console.log("Component mounted");
}, []);
```
