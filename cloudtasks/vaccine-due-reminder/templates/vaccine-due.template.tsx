import type { ReactElement } from 'react'

export type VaccineDueTemplateProps = {
  ownerName: string
  petName: string
  vaccineName: string
  dueDate: string
}

function VaccineDueTemplate({
  ownerName,
  petName,
  vaccineName,
  dueDate,
}: VaccineDueTemplateProps): ReactElement {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{`La vacuna de ${petName} está próxima a vencer`}</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: '24px 12px',
          backgroundColor: '#f4f6f5',
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: '#1f2a24',
        }}
      >
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          border={0}
          style={{ borderCollapse: 'collapse' }}
        >
          <tbody>
            <tr>
              <td align="center">
                <table
                  role="presentation"
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  border={0}
                  style={{
                    borderCollapse: 'collapse',
                    maxWidth: '560px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                  }}
                >
                  <tbody>
                    <tr>
                      <td style={{ padding: '32px 28px 8px 28px' }}>
                        <h1 style={{ margin: 0, fontSize: '20px', lineHeight: '28px' }}>
                          La vacuna de {petName} está próxima a vencer
                        </h1>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 28px', fontSize: '15px', lineHeight: '24px' }}>
                        <p style={{ margin: '0 0 16px 0' }}>Hola {ownerName},</p>
                        <p style={{ margin: '0 0 16px 0' }}>
                          Te recordamos que la vacuna <strong>{vaccineName}</strong> de{' '}
                          <strong>{petName}</strong> vence el <strong>{dueDate}</strong>.
                        </p>
                        <p style={{ margin: '0 0 16px 0' }}>
                          Agenda su próxima cita para mantener la protección de tu mascota al día.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 28px 32px 28px' }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '13px',
                            lineHeight: '20px',
                            color: '#5b6b63',
                          }}
                        >
                          Si ya aplicaste esta vacuna, puedes ignorar este mensaje.
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}

export default VaccineDueTemplate

export function renderVaccineDueEmail(_props: VaccineDueTemplateProps): string {
  throw new Error('Not implemented: renderVaccineDueEmail')
}
