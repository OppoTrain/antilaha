interface UpdateNavbarInterface {
  cartUpdated: () => void;
  wishlistUpdated: () => void;
}

declare global {
  interface Window {
    updateNavbar?: UpdateNavbarInterface; // Make it optional with the ? modifier
  }
}

export {};
