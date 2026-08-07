import { Card,CardContent,Typography,} from '@mui/material'

export default function DashboardCard({ title,value,color = 'primary.main', }) {
  return (
    <Card elevation={2} sx={{ borderTop: 4, borderColor: color, }} >

      <CardContent>
        <Typography color="text.secondary" gutterBottom >
          {title}
        </Typography>

        <Typography variant="h4" fontWeight="bold" >
          {value}
        </Typography>
        
      </CardContent>

    </Card>
  )
}