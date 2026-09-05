import { Router } from "express";

import auth from "../../middleware/auth.js";

import { favoriteController } from "./favorite.controller.js";

const router = Router();

// Toate rutele necesită autentificare
router.use(auth);

// Favoritele utilizatorului
router.get(
    "/",
    favoriteController.getFavorites.bind(
        favoriteController
    )
);

// Verifică dacă un anunț este favorit
router.get(
    "/check/:listingId",
    favoriteController.checkFavorite.bind(
        favoriteController
    )
);

// Adaugă la favorite
router.post(
    "/:listingId",
    favoriteController.addFavorite.bind(
        favoriteController
    )
);

// Elimină din favorite
router.delete(
    "/:listingId",
    favoriteController.removeFavorite.bind(
        favoriteController
    )
);

// Toggle (add/remove)
router.post(
    "/:listingId/toggle",
    favoriteController.toggleFavorite.bind(
        favoriteController
    )
);

export default router;