## Description

Projet Openclassrooms: création d'une API pour un site de notations de livres. Système d'enregistrement sécurisé d'utilisateur et d'authentification avec *jsonwebtoken* et bcrypt; opérations CRUD.

**Tags**: *Express, Mongoose, bcrypt, jsonwebtoken, multer, sharp*

<p align="center">
  <img src="./assets/project7.png" alt="Illustration du site">
</p>

## Installation

### `npm install`

Afin d'installer toutes les librairies


### `mkdir images`

Créer un dossier *images* où seront stockées les images en local.

### `mkdir .env`

Créer un fichier .env afin de stocker vos propres variables d'environnement.  
Vous aurez besoin de 4 variables nommées ainsi:  
PORT *port 4000 par défaut*  
DB_CONNECTION *votre connection à mongoDB commençant par : "mongodb+srv://\[username]:\[password]@cluster0...*  
RANDOM_TOKEN_SECRET *générer une clé secrète pour le token. Vous pouvez utiliser la commande sur node : require('crypto').randomBytes(64).toString("hex")*  
TIME *temps d'expiration du token, exemple: "1h"*

### `nodemon serve`

Commande globale afin de lancer le serveur.  
Penser à installer nodemon en dependance de développement avec la commande *npm install --save-dev nodemon*

## Tester l'API

Deux solutions :

Cloner la partie frontend du site [https://github.com/AvirKarakitsos/OC_project7_frontend_react](https://github.com/AvirKarakitsos/OC_project7_frontend_react)

Utiliser la documentation OpenAPI en local *http://\[yourlocalhost]/api-docs* 

