# Guide d'utilisation — Administration Ataribal100original

## Connexion

1. Ouvrez `/setup` une seule fois après l'installation, saisissez le jeton de configuration du serveur, un email et un mot de passe d'au moins 10 caractères. Le jeton se trouve dans `ADMIN_SETUP_TOKEN` du fichier `.env` ou, à défaut, dans le fichier `data/setup-token` sur le serveur (`cat data/setup-token`). Tant qu'aucun administrateur n'existe, la page de connexion affiche un bouton « Créer le compte administrateur ».
2. Ensuite, connectez-vous sur `/admin`. Il n'existe aucune inscription publique.
3. Mot de passe oublié ? Sur le serveur, exécutez `npx tsx scripts/reset-admin-password.ts votre@email.ma` et saisissez le nouveau mot de passe lorsque demandé. Aucun email n'est requis.

## Ajouter un article en moins d'une minute

1. Dans **Articles**, cliquez sur **+ Ajouter un article**.
2. Déposez vos photos (ou cliquez sur la zone). Choisissez la photo principale avec l'étoile, réordonnez avec les flèches, remplacez ou supprimez si besoin.
3. Renseignez le nom, la marque, la catégorie, le prix en MAD et facultativement la description et la référence.
4. Choisissez le type (Homme/Femme/Enfant/Unisexe), l'état, une note sur les éventuels défauts, puis les tailles.
5. Cochez **Attari Bal 1** et/ou **Attari Bal 2**, puis saisissez la quantité réelle dans chaque magasin. Une quantité à 0 rend l'article indisponible dans ce magasin uniquement.
6. Cliquez sur **Publier l'article**. Vous pouvez aussi enregistrer un brouillon ou utiliser **Aperçu** avant publication.

Un article ne peut être publié que s'il possède au moins une photo et une quantité positive dans un magasin.

## Gestion courante

- **Recherche et filtres** : par nom/marque, catégorie, état, type, taille, magasin, stock et statut.
- **Stock** : modifiez directement les quantités dans la colonne « Stock par magasin », puis cliquez sur « Sauver ». Les deux magasins sont indépendants.
- **Actions rapides** : modifier (crayon), dupliquer (copie en brouillon), publier (↑), dépublier (↓), supprimer (corbeille, confirmation demandée).
- **Actions groupées** : cochez plusieurs articles, puis publier / dépublier / marquer vendu / supprimer. Une confirmation est demandée pour les actions destructives.
- **Marquer comme vendu** : dans la fiche de l'article, le bouton met le statut « Vendu » et remet les quantités à zéro. Le site affiche alors clairement « VENDU ».
- **Catégories / Marques** : ajoutez, renommez ou supprimez des entrées. Supprimer une catégorie ne supprime pas les articles ; il faudra les reclasser.
- **Paramètres** : téléphone, email, liens Instagram et WhatsApp communauté, texte de la page À propos.

## Bon à savoir

- Le site est une vitrine : aucun paiement, commande ou livraison en ligne. Les clients vous contactent sur WhatsApp puis achètent en boutique.
- Les informations saisies sont affichées telles quelles sur le site public (aucune traduction automatique).
- Les photos sont enregistrées sur le serveur, pas dans le navigateur. Après publication, l'image reste disponible même si vous fermez l'ordinateur.


<!-- Documentation-only commit to trigger the connected Cloudflare deployment after updating Worker secrets. -->
