/**
 * Constante de compilation d'Angular : `true` dans le bundle serveur, `false` dans le bundle
 * navigateur. Remplacée à la construction, elle permet à esbuild de supprimer les branches
 * serveur : `firebase/*` n'est ainsi jamais résolu côté serveur (sa version Node embarque
 * gRPC, un module CommonJS).
 */
declare const ngServerMode: boolean;
