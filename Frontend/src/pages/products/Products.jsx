import {
  useEffect,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import api from '../../api/axiosInstance'
import useAuth from '../../context/useAuth'

function sortProductList(products, sortValue) {
  const [property, direction] =
    sortValue.split(',')

  return [...products].sort(
    (firstProduct, secondProduct) => {
      let comparison

      if (property === 'nom') {
        comparison = (
          firstProduct.nom || ''
        ).localeCompare(
          secondProduct.nom || '',
          'fr',
          {
            sensitivity: 'base',
          },
        )
      } else {
        comparison =
          Number(firstProduct[property] || 0) -
          Number(secondProduct[property] || 0)
      }

      if (direction === 'desc') {
        return -comparison
      }

      return comparison
    },
  )
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [keyword, setKeyword] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [lowStock, setLowStock] = useState(false)

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(5)
  const [sort, setSort] = useState('nom,asc')

  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] =
    useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [
    productToDelete,
    setProductToDelete,
  ] = useState(null)

  const [deleting, setDeleting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const { hasRole } = useAuth()

  const canManageProducts = hasRole(
    'ADMIN',
    'MANAGER',
  )

  const canDeleteProducts = hasRole('ADMIN')

  const canViewLowStock = canManageProducts

  const filterActive =
    Boolean(keyword.trim()) ||
    maxPrice !== '' ||
    lowStock

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let actif = true

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        setError('')

        let response

        // Filtre : stock faible
        if (lowStock && canViewLowStock) {
          response = await api.get(
            '/api/products/low-stock',
          )

          if (actif) {
            const sortedProducts =
              sortProductList(
                response.data,
                sort,
              )

            setProducts(sortedProducts)

            setTotalElements(
              sortedProducts.length,
            )

            setTotalPages(
              sortedProducts.length > 0 ? 1 : 0,
            )
          }

          return
        }

        // Filtre : prix maximum
        if (maxPrice !== '') {
          response = await api.get(
            `/api/products/price/${maxPrice}`,
          )

          if (actif) {
            const sortedProducts =
              sortProductList(
                response.data,
                sort,
              )

            setProducts(sortedProducts)

            setTotalElements(
              sortedProducts.length,
            )

            setTotalPages(
              sortedProducts.length > 0 ? 1 : 0,
            )
          }

          return
        }

        // Recherche par nom ou catégorie
        if (keyword.trim()) {
          response = await api.get(
            '/api/products/search',
            {
              params: {
                keyword: keyword.trim(),
              },
            },
          )

          if (actif) {
            const sortedProducts =
              sortProductList(
                response.data,
                sort,
              )

            setProducts(sortedProducts)

            setTotalElements(
              sortedProducts.length,
            )

            setTotalPages(
              sortedProducts.length > 0 ? 1 : 0,
            )
          }

          return
        }

        // Liste paginée et triée
        response = await api.get(
          '/api/products/page',
          {
            params: {
              page,
              size,
              sort,
            },
          },
        )

        if (actif) {
          setProducts(response.data.content)

          setTotalPages(
            response.data.totalPages,
          )

          setTotalElements(
            response.data.totalElements,
          )
        }
      } catch (requestError) {
        if (actif) {
          const message =
            requestError.response?.data?.message ||
            'Impossible de charger les produits'

          setError(message)
        }
      } finally {
        if (actif) {
          setLoading(false)
        }
      }
    }, 300)

    return () => {
      actif = false
      clearTimeout(timer)
    }
  }, [
    keyword,
    maxPrice,
    lowStock,
    page,
    size,
    sort,
    canViewLowStock,
    refreshKey,
  ])

  function handleSearch(event) {
    setKeyword(event.target.value)
    setMaxPrice('')
    setLowStock(false)
    setPage(0)
  }

  function handlePrice(event) {
    setMaxPrice(event.target.value)
    setKeyword('')
    setLowStock(false)
    setPage(0)
  }

  function handleLowStock(event) {
    setLowStock(event.target.checked)
    setKeyword('')
    setMaxPrice('')
    setPage(0)
  }

  function handlePageChange(event, newPage) {
    void event
    setPage(newPage - 1)
  }

  function handleSizeChange(event) {
    setSize(Number(event.target.value))
    setPage(0)
  }

  function handleSortChange(event) {
    setSort(event.target.value)
    setPage(0)
  }

  function openDeleteDialog(product) {
    setProductToDelete(product)
  }

  function closeDeleteDialog() {
    if (!deleting) {
      setProductToDelete(null)
    }
  }

  async function handleDeleteProduct() {
    if (!productToDelete) {
      return
    }

    try {
      setDeleting(true)
      setError('')

      await api.delete(
        `/api/products/${productToDelete.id}`,
      )

      setProductToDelete(null)

      if (
        !filterActive &&
        products.length === 1 &&
        page > 0
      ) {
        setPage((currentPage) => currentPage - 1)
      } else {
        setRefreshKey((current) => current + 1)
      }
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        'Impossible de supprimer le produit'

      setError(message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Box>
      {/* Titre et bouton d’ajout */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: {
            xs: 'column',
            sm: 'row',
          },
          justifyContent: 'space-between',
          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },
          gap: 2,
          marginBottom: 3,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Gestion des produits
          </Typography>

          <Typography color="text.secondary">
            Consultez et gérez les produits.
          </Typography>
        </Box>

        {canManageProducts && (
          <Button
            component={Link}
            to="/products/new"
            variant="contained"
          >
            Ajouter un produit
          </Button>
        )}
      </Box>

      {/* Recherche, filtres et tri */}
      <Paper
        sx={{
          padding: 2,
          marginBottom: 2,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
              lg: '2fr 1fr 1fr 1fr',
            },
            gap: 2,
            alignItems: 'center',
          }}
        >
          <TextField
            label="Rechercher un produit"
            placeholder="Nom ou catégorie"
            value={keyword}
            onChange={handleSearch}
            size="small"
          />

          <TextField
            label="Prix maximum"
            type="number"
            value={maxPrice}
            onChange={handlePrice}
            size="small"
            slotProps={{
              htmlInput: {
                min: 0,
              },
            }}
          />

          <TextField
            select
            label="Trier par"
            value={sort}
            onChange={handleSortChange}
            size="small"
          >
            <MenuItem value="nom,asc">
              Nom : A vers Z
            </MenuItem>

            <MenuItem value="nom,desc">
              Nom : Z vers A
            </MenuItem>

            <MenuItem value="prix,asc">
              Prix : croissant
            </MenuItem>

            <MenuItem value="prix,desc">
              Prix : décroissant
            </MenuItem>

            <MenuItem value="quantiteStock,asc">
              Stock : croissant
            </MenuItem>

            <MenuItem value="quantiteStock,desc">
              Stock : décroissant
            </MenuItem>
          </TextField>

          <TextField
            select
            label="Éléments par page"
            value={size}
            onChange={handleSizeChange}
            size="small"
            disabled={filterActive}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </TextField>
        </Box>

        {canViewLowStock && (
          <FormControlLabel
            sx={{
              marginTop: 1,
            }}
            control={
              <Checkbox
                checked={lowStock}
                onChange={handleLowStock}
              />
            }
            label="Afficher uniquement le stock faible"
          />
        )}
      </Paper>

      {/* Message d’erreur */}
      {error && (
        <Typography
          color="error"
          sx={{
            marginBottom: 2,
          }}
        >
          {error}
        </Typography>
      )}

      {/* Chargement */}
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            padding: 5,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Tableau des produits */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Catégorie</TableCell>
                  <TableCell>Prix</TableCell>
                  <TableCell>Stock</TableCell>

                  <TableCell align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                    >
                      Aucun produit trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow
                      key={product.id}
                      hover
                    >
                      <TableCell>
                        {product.nom}
                      </TableCell>

                      <TableCell>
                        {product.categorie}
                      </TableCell>

                      <TableCell>
                        {Number(
                          product.prix,
                        ).toFixed(2)}{' '}
                        DH
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            product.quantiteStock
                          }
                          size="small"
                          color={
                            product.quantiteStock === 0
                              ? 'error'
                              : product.quantiteStock < 5
                                ? 'warning'
                                : 'success'
                          }
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent:
                              'flex-end',
                            flexWrap: 'wrap',
                            gap: 1,
                          }}
                        >
                          {/* Accessible à tous */}
                          <Button
                            component={Link}
                            to={`/products/${product.id}`}
                            size="small"
                          >
                            Voir
                          </Button>

                          {/* ADMIN et MANAGER */}
                          {canManageProducts && (
                            <Button
                              component={Link}
                              to={`/products/${product.id}/edit`}
                              size="small"
                            >
                              Modifier
                            </Button>
                          )}

                          {/* ADMIN uniquement */}
                          {canDeleteProducts && (
                            <Button
                              color="error"
                              size="small"
                              onClick={() =>
                                openDeleteDialog(
                                  product,
                                )
                              }
                            >
                              Supprimer
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Total et pagination */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: {
                xs: 'column',
                sm: 'row',
              },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              marginTop: 2,
            }}
          >
            <Typography color="text.secondary">
              Total : {totalElements} produit(s)
            </Typography>

            {!filterActive &&
              totalPages > 1 && (
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={handlePageChange}
                  color="primary"
                />
              )}
          </Box>
        </>
      )}

      {/* Confirmation de suppression */}
      <Dialog
        open={Boolean(productToDelete)}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>
          Supprimer le produit
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Voulez-vous vraiment supprimer le produit{' '}
            <strong>
              {productToDelete?.nom}
            </strong>
            {' '}?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={closeDeleteDialog}
            disabled={deleting}
          >
            Annuler
          </Button>

          <Button
            onClick={handleDeleteProduct}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting
              ? 'Suppression...'
              : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}