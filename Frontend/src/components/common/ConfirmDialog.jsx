import { Button,Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle,} from '@mui/material'

export default function ConfirmDialog({open, title,message,loading,onCancel,onConfirm, }) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onCancel} >
      <DialogTitle>
        {title}
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel} disabled={loading} >
          Annuler
        </Button>

        <Button color="error" variant="contained" onClick={onConfirm}  disabled={loading}>
          {loading ? 'Suppression...' : 'Supprimer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}