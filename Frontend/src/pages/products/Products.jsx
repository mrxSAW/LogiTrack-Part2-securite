import { useEffect,useState,} from 'react'

import { Link } from 'react-router-dom'

import {Alert,Box,Button,Checkbox,Chip,CircularProgress,FormControlLabel, MenuItem,Pagination,Paper,Table,TableBody,TableCell,TableContainer,TableHead, TableRow,TextField,  Typography,} from '@mui/material'
import api from '../../api/axiosInstance'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import useAuth from '../../context/useAuth'

function sortProductList(products, sort) {
  const parts = sort.split(',')
  const property = parts[0]
  const direction = parts[1]

  const sortedProducts = [...products]

  sortedProducts.sort(function compareProducts(firstProduct, secondProduct) {
    let result = 0

    if (property === 'nom') {
      result = firstProduct.nom.localeCompare( secondProduct.nom, 'fr')
    } else {
      result =Number(firstProduct[property]) -Number(secondProduct[property])
    }

    if (direction === 'desc') {
      return -result
    }

    return result
  })

  return sortedProducts
}

function getStockColor(quantity) {
  if (quantity === 0) {
    return 'error'
  }

  if (quantity < 5) {
    return 'warning'
  }

  return 'success'
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
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [productToDelete, setProductToDelete] =useState(null)
  const auth = useAuth()
  const canManage = auth.hasRole('ADMIN','MANAGER')
  const canDelete = auth.hasRole('ADMIN')
  const filterActive =Boolean(keyword.trim()) ||maxPrice !== '' ||lowStock

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        setError('')

        let response

        if (lowStock && canManage) {
          response = await api.get('/api/products/low-stock')

          const sortedProducts = sortProductList(response.data,sort)

          setProducts(sortedProducts)
          setTotalElements(sortedProducts.length)
          setTotalPages( sortedProducts.length > 0 ? 1 : 0 )

          return
        }

        if (maxPrice !== '') {
          response = await api.get( `/api/products/price/${maxPrice}`)

          const sortedProducts = sortProductList(response.data,sort)

          setProducts(sortedProducts)
          setTotalElements(sortedProducts.length)
          setTotalPages( sortedProducts.length > 0 ? 1 : 0)

          return
        }

        if (keyword.trim()) {
          response = await api.get('/api/products/search',
            {params: {keyword: keyword.trim(), },})

          const sortedProducts = sortProductList(response.data, sort)

          setProducts(sortedProducts)
          setTotalElements(sortedProducts.length)
          setTotalPages(sortedProducts.length > 0 ? 1 : 0)

          return
        }

        response = await api.get(  '/api/products/page',
          {
            params: {page,size,sort,},
          }
        )

        setProducts(response.data.content)
        setTotalPages(response.data.totalPages)
        setTotalElements(
          response.data.totalElements
        )
      } catch (requestError) {
        const backendMessage = requestError.response?.data?.message

        setError(
          backendMessage || 'Impossible de charger les produits'
        )
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [keyword,maxPrice, lowStock,page,size,sort,canManage,reload,])

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

  function handleSortChange(event) {
    setSort(event.target.value)
    setPage(0)
  }

  function handleSizeChange(event) {
    setSize(Number(event.target.value))
    setPage(0)
  }

  function handlePageChange(event, newPage) {
    void event
    setPage(newPage - 1)
  }

  function openDeleteDialog(product) {
    setProductToDelete(product)
  }

  function closeDeleteDialog() {
    if (!deleting) {
      setProductToDelete(null)
    }
  }

  async function deleteProduct() {
    if (!productToDelete) {
      return
    }

    try {
      setDeleting(true)
      setError('')

      await api.delete(`/api/products/${productToDelete.id}`)

      setProductToDelete(null)

      if (!filterActive && products.length === 1 && page > 0) {
        setPage(page - 1)
      } else {
        setReload(reload + 1)
      }
    } catch (requestError) {
      const backendMessage = requestError.response?.data?.message

      setError(backendMessage || 'Impossible de supprimer le produit')
    
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex',flexDirection: {xs: 'column',sm: 'row',},justifyContent: 'space-between', alignItems: {xs: 'flex-start', sm: 'center',}, gap: 2,marginBottom: 3, }} >
        <Box>
          <Typography variant="h4"gutterBottom>
            Gestion des produits
          </Typography>

          <Typography color="text.secondary">
            Consultez et gérez les produits.
          </Typography>
        </Box>

        {canManage && (
          <Button component={Link} to="/products/new" variant="contained" >
            Ajouter un produit
          </Button>
        )}
      </Box>

      <Paper sx={{padding: 2,marginBottom: 2,}} >
        <Box sx={{display: 'grid',   gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: '2fr 1fr 1fr 1fr',}, gap: 2, alignItems: 'center',  }} >
          
          <TextField  label="Rechercher un produit" placeholder="Nom ou catégorie" value={keyword}
            onChange={handleSearch} size="small"  />

          <TextField label="Prix maximum" type="number" value={maxPrice}
            onChange={handlePrice}  size="small" slotProps={{ htmlInput: {  min: 0, }, }} />

          <TextField select label="Trier par" value={sort}
            onChange={handleSortChange} size="small" >
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

          <TextField select label="Éléments par page" value={size}
            onChange={handleSizeChange} size="small"  disabled={filterActive} >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </TextField>
        </Box>

        {canManage && (
          <FormControlLabel sx={{ marginTop: 1 }}
            control={
              <Checkbox  checked={lowStock}  onChange={handleLowStock} />  }  
                 label="Afficher uniquement le stock faible" />
        )}

      </Paper>

      {error && (
        <Alert  severity="error"  sx={{ marginBottom: 2 }}  >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box  sx={{ display: 'flex',  justifyContent: 'center', padding: 5, }} >
          <CircularProgress />
        </Box>
      ) : (
        <>
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
                {products.length === 0 && (
                  <TableRow>
                    <TableCell   colSpan={5} align="center" >
                      Aucun produit trouvé
                    </TableCell>
                  </TableRow>
                )}

                {products.map(function showProduct(
                  product
                ) {
                  return (
                    <TableRow   key={product.id} hover >
                      <TableCell>
                        {product.nom}
                      </TableCell>

                      <TableCell>
                        {product.categorie}
                      </TableCell>

                      <TableCell>
                        {Number(product.prix).toFixed(2)}{' '} DH
                      </TableCell>

                      <TableCell>
                        <Chip label={product.quantiteStock}  size="small"
                          color={getStockColor(product.quantiteStock )} />
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
                          <Button
                            component={Link}
                            to={`/products/${product.id}`}
                            size="small"
                          >
                            Voir
                          </Button>

                          {canManage && (
                            <Button
                              component={Link}
                              to={`/products/${product.id}/edit`}
                              size="small"
                            >
                              Modifier
                            </Button>
                          )}

                          {canDelete && (
                            <Button
                              color="error"
                              size="small"
                              onClick={() =>
                                openDeleteDialog(
                                  product
                                )
                              }
                            >
                              Supprimer
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>

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

      <ConfirmDialog
        open={Boolean(productToDelete)}
        title="Supprimer le produit"
        message={ productToDelete ? `Voulez-vous vraiment supprimer ${productToDelete.nom} ?`  : ''}
        loading={deleting}
        onCancel={closeDeleteDialog}
        onConfirm={deleteProduct}
      />
    </Box>
  )
}