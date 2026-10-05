export const WHATSAPP_LANGUAGE = 'es';

// Solo utility: mensajes sobre un hecho concreto del cliente (una cita, un registro de vacunación).
// El saludo de cumpleaños no está aquí a propósito: Meta lo clasifica como marketing, se factura
// aparte y exige otro tipo de consentimiento.
export const whatsappTemplateOptions = [
  {
    name: 'appointment_reminder',
    label: 'Recordatorio de cita',
    language: WHATSAPP_LANGUAGE,
    body: 'Hola {{client_name}}, te recordamos la cita de {{pet_name}} en {{clinic_name}} el {{date}} a las {{time}}.',
    parameters: [
      {name: 'client_name', source: 'client', example: 'Carla'},
      {name: 'pet_name', source: 'input', example: 'Luna'},
      {name: 'clinic_name', source: 'organization', example: 'Clínica Norte'},
      {name: 'date', source: 'input', example: '12 de octubre'},
      {name: 'time', source: 'input', example: '10:30'}
    ]
  },
  {
    name: 'vaccine_due_reminder',
    label: 'Vacuna próxima a vencer',
    language: WHATSAPP_LANGUAGE,
    body: 'Hola {{client_name}}, según el registro de vacunación de {{pet_name}} en {{clinic_name}}, la vacuna {{vaccine}} vence el {{date}}.',
    parameters: [
      {name: 'client_name', source: 'client', example: 'Carla'},
      {name: 'pet_name', source: 'input', example: 'Luna'},
      {name: 'clinic_name', source: 'organization', example: 'Clínica Norte'},
      {name: 'vaccine', source: 'input', example: 'Rabia'},
      {name: 'date', source: 'input', example: '30 de octubre'}
    ]
  }
];

export const whatsappTemplateNames = whatsappTemplateOptions.map((option) => option.name);

export const whatsappTemplateMap = Object.fromEntries(whatsappTemplateOptions.map((option) => [option.name, option]));
