Ouvrir 3 terminaux différents :

Terminal 1 (Serveur Web) :

node server.js
-> Va sur http://localhost:3000. 

Terminal 2 (Producteur) :

node producer.js
-> Les graphiques commencent à bouger ! Le log à droite défile.

Terminal 3 (Worker Math) :

node worker.js
-> Au bout de quelques secondes : Le producteur va générer un "faux crash" aléatoirement. 
-> Le Worker va le voir, calculer, et envoyer une alerte. 

Les 4 composants (Producteur, RabbitMQ, Worker, Frontend) discutent ensemble.