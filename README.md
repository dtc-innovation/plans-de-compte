# plans-de-compte

Un outil pour récupérer des plans de compte à partir de &lt;DocumentBudgetaire>s

Il s'agit d'un outil en ligne de commande

L'intention d'usage est le suivant : 

```sh
plans-de-compte --in dir1 --out dir2
```

Trouve des documents budgétaires dans `dir1`, à partir de ces fichiers, s'assure que les plans de comptes sont disponibles dans `dir2` et les télécharge s'ils n'y sont pas


## Exemple

`npm start -- -i input -o output`