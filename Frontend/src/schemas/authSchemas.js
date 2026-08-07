import * as yup from 'yup'

export const loginSchema = yup.object({
  email: yup.string().required("L'adresse email est obligatoire").email("L'adresse email n'est pas valide"),

  password: yup.string().required('Le mot de passe est obligatoire'),
})

export const registerSchema = yup.object({
  nom: yup.string().trim().required('Le nom est obligatoire'),

  prenom: yup.string().trim().required('Le prénom est obligatoire'),

  email: yup.string().trim().required("L'adresse email est obligatoire").email("L'adresse email n'est pas valide"),

  password: yup.string().required('Le mot de passe est obligatoire').min(4,'Le mot de passe doit contenir au moins 8 caractères',),

  confirmationPassword: yup.string().required('La confirmation est obligatoire')
    .oneOf( [yup.ref('password')],'Les mots de passe ne correspondent pas',),
})