import { Button } from '@mui/material';
import './App.css'
import CodeEditor from './CodeEditor'
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { createTheme, ThemeProvider } from '@mui/material/styles';

let theme = createTheme({
  // Theme customization goes here as usual, including tonalOffset and/or
  // contrastThreshold as the augmentColor() function relies on these
});
theme = createTheme(theme, {
  // Custom colors created with augmentColor go here
  palette: {
    salmon: theme.palette.augmentColor({
      color: {
        main: '#94F97F',
      },
      name: 'salmon',
    }),
  },
});

function App() {
  const handle = useFullScreenHandle();

  return (
    <>
      <ThemeProvider theme={theme}>
      <Button onClick={handle.enter} variant='contained' color="salmon" size='large'>
        Enter fullscreen
        </Button>
        </ThemeProvider>
      <FullScreen handle={handle}>
        <CodeEditor />
      </FullScreen>

    </>
  )
}

export default App
