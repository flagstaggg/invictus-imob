import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/pages.css';
import 'lenis/dist/lenis.css';
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { initRouter } from './router.js';
import { initSmoothScroll } from './utils/smoothScroll.js';
import { initFavoritesSync } from './utils/favorites.js';


// Renderiza asdknasdka
initSmoothScroll();
initFavoritesSync();
renderHeader();
renderFooter();
initRouter();
