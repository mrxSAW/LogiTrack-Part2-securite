import * as yup from 'yup'

export const clientSchema = yup.object({
  nom: yup
    .string()
    .trim()
    .required('Le nom est obligatoire'),

  email: yup
    .string()
    .trim()
    .required("L'adresse email est obligatoire")
    .email("L'adresse email n'est pas valide"),

 telephone: yup
  .string()
  .trim()
  .required('Le téléphone est obligatoire')
  .matches(
    /^[0-9+ ]{9,15}$/,
    'Le téléphone doit contenir entre 9 et 15 chiffres',
  ),

  ville: yup
    .string()
    .trim()
    .required('La ville est obligatoire'),
})