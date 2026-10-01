import Card, { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'

export default function CardDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Luna · Golden Retriever</CardTitle>
          <CardDescription>Propietaria: María Fernández</CardDescription>
        </CardHeader>
        <CardContent>Próxima vacuna antirrábica el 12 de octubre.</CardContent>
        <CardFooter className="text-muted-foreground">Última visita: 3 de septiembre</CardFooter>
      </Card>
      <Card className="border-primary bg-primary-soft">
        <CardHeader>
          <CardTitle>className externo gana</CardTitle>
          <CardDescription className="text-primary">Borde y fondo sobrescritos desde fuera.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
