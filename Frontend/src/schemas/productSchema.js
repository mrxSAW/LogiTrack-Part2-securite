import * as yup from 'yup'

export const productSchema = yup.object({
  nom: yup
    .string()
    .trim()
    .required(
      'Le nom du produit est obligatoire'
    ),

  categorie: yup
    .string()
    .trim()
    .required('La catégorie est obligatoire'),

  prix: yup
    .number()
    .typeError('Le prix doit être un nombre')
    .required('Le prix est obligatoire')
    .moreThan(
      0,
      'Le prix doit être supérieur à zéro'
    ),

  quantiteStock: yup
    .number()
    .typeError(
      'La quantité doit être un nombre'
    )
    .required('La quantité est obligatoire')
    .integer(
      'La quantité doit être un nombre entier'
    )
    .min(
      0,
      'La quantité ne peut pas être négative'
    ),
})