import { http, HttpResponse } from 'msw';

export const rulesHandler = () =>
  http.get('http://event-api-test/:databaseName/rules', () =>
    HttpResponse.json({
      content: [
        {
          id: '3793cd9f-4788-4e20-a5d0-3d5660c1ab77',
          name: 'Control call3 10',
          description: 'control a la camioneta azul 5/10/26',
          type: 'null',
          inout: 'inout',
          enabled: 1,
          deleted: 0,
          alerts: [
            {
              id: '4e405461-9c3c-4513-a7f2-fb7e3083d200',
              name: 'control del vehículo azul',
              color: '#00acc1',
              rule_id: '3793cd9f-4788-4e20-a5d0-3d5660c1ab77',
              sound_id: '4cbd0c4b-d1c1-4fa8-ad92-634574ab7a02',
            },
          ],
          frequency: [
            {
              id: 'b63ee7f4-17db-4994-9c51-4051d3f93fe4',
              rule_id: '3793cd9f-4788-4e20-a5d0-3d5660c1ab77',
              start_time: 1791216052992,
              end_time: 1791237656416,
              frequency: '1',
              rule: {
                id: '3793cd9f-4788-4e20-a5d0-3d5660c1ab77',
                name: 'Control call3 10',
                description: 'control a la camioneta azul 5/10/26',
                type: 'null',
                inout: 'inout',
                enabled: 1,
                deleted: 0,
              },
            },
          ],
          events: [
            {
              id: 'e09820c2-12b1-4816-a52b-172a8c35f0b9',
              rule_id: '3793cd9f-4788-4e20-a5d0-3d5660c1ab77',
              rule: {
                id: '3793cd9f-4788-4e20-a5d0-3d5660c1ab77',
                name: 'Control call3 10',
                description: 'control a la camioneta azul 5/10/26',
                type: 'null',
                inout: 'inout',
                enabled: 1,
                deleted: 0,
              },
            },
            {
              id: 'c9ff65d0-f120-456b-b7c0-bc1a819400ec',
              rule_id: '3793cd9f-4788-4e20-a5d0-3d5660c1ab77',
              rule: {
                id: '3793cd9f-4788-4e20-a5d0-3d5660c1ab77',
                name: 'Control call3 10',
                description: 'control a la camioneta azul 5/10/26',
                type: 'null',
                inout: 'inout',
                enabled: 1,
                deleted: 0,
              },
            },
          ],
          groups: [],
          vehicles: [
            {
              id: 'ee3bb5b9-06b9-4679-b9fb-b2febb8d6d92',
              rule_id: '3793cd9f-4788-4e20-a5d0-3d5660c1ab77',
              vehicle_id: '90b92b1e-fb81-493e-81a0-9c2cd1d34c0e',
            },
          ],
          notifications: [
            {
              id: 'ce826ea0-6761-4c7f-982e-0c829a130870',
              rule_id: '3793cd9f-4788-4e20-a5d0-3d5660c1ab77',
              channel_id: '3246cd72-beb9-4946-b572-06c50c57a08d',
              channel_data:
                '[[{"field":"toList","splitArray":",","description":"A","type":"email","default":"","value":"arnaldo.munoz@kernotec.com"},{"field":"subject","description":"Titulo","type":"text","default":"","value":"Control de la camioneta azul"},{"field":"message","description":"Mensaje","type":"text","default":"","value":"Control de la camioneta azul"}]]',
            },
            {
              id: 'b1d1ca5d-e101-43c2-a156-0dee01d83819',
              rule_id: '3793cd9f-4788-4e20-a5d0-3d5660c1ab77',
              channel_id: 'a034a711-13bb-44d5-b4cd-ef718d56071f',
              channel_data:
                '[[{"field":"toList","splitArray":",","description":"Teféfono","type":"number","default":"+591","value":"59160174745"},{"field":"message","description":"Mensaje","type":"text","default":"*:rule.name*\\n\\nEvento del vehículo :vehicle.name\\n\\n:rule.inout :rule.type :geofence.name:point.name\\n:devent.name :devent.operator :devent.condition\\n\\nhttps://www.google.com/maps?q=:device.lat,:device.lon\\n","value":"*:rule.name*\\n\\nEvento del vehículo :vehicle.name\\n\\n:rule.inout :rule.type :geofence.name:point.name\\n:devent.name :devent.operator :devent.condition\\n\\nhttps://www.google.com/maps?q=:device.lat,:device.lon\\n"}]]',
            },
          ],
          geofences: [
            {
              id: '40411c39-6767-434b-9983-9ddaab425dc4',
              rule_id: '3793cd9f-4788-4e20-a5d0-3d5660c1ab77',
              geofence_id: '72777349-d59a-48c4-aa8e-8738f8d00b39',
              inout: 'inout',
            },
            {
              id: 'aef93b0d-5995-44a1-b134-c2401264101e',
              rule_id: '3793cd9f-4788-4e20-a5d0-3d5660c1ab77',
              geofence_id: '60dc0c42-c1ff-47ba-bdf6-718a9ccf1a8e',
              inout: 'inout',
            },
          ],
          ipoints: [
            {
              id: 'b4bcb75e-6853-4ff9-b440-c334731ead6e',
              rule_id: '3793cd9f-4788-4e20-a5d0-3d5660c1ab77',
              geofence_id: '24adc216-f362-4ec2-bea1-e6738c860b14',
              inout: 'inout',
            },
            {
              id: 'bc881a36-1be8-4684-b4a9-6057b0e963f7',
              rule_id: '3793cd9f-4788-4e20-a5d0-3d5660c1ab77',
              geofence_id: 'e4fa9ef3-e60d-4944-bce5-b8968e09c885',
              inout: 'inout',
            },
          ],
        },
        {
          id: '4327b071-283e-4330-860d-3c682fb9f73f',
          name: '3 anillos de control',
          description: '',
          type: 'null',
          inout: 'inout',
          enabled: 1,
          deleted: 0,
          alerts: [
            {
              id: 'd1cd0a23-bf29-464c-8834-8ad6151103cc',
              name: 'Alerta de puntos de control ',
              color: '#00bcd4',
              rule_id: '4327b071-283e-4330-860d-3c682fb9f73f',
              sound_id: '4cbd0c4b-d1c1-4fa8-ad92-634574ab7a02',
            },
          ],
          frequency: [
            {
              id: '300e06de-b810-4ede-ac13-d54346d2754b',
              rule_id: '4327b071-283e-4330-860d-3c682fb9f73f',
              start_time: 1791216013790,
              end_time: 1791234017160,
              frequency: '1',
              rule: {
                id: '4327b071-283e-4330-860d-3c682fb9f73f',
                name: '3 anillos de control',
                description: '',
                type: 'null',
                inout: 'inout',
                enabled: 1,
                deleted: 0,
              },
            },
          ],
          events: [
            {
              id: 'a2e490c7-0563-451d-b050-8c585807aa3a',
              rule_id: '4327b071-283e-4330-860d-3c682fb9f73f',
              rule: {
                id: '4327b071-283e-4330-860d-3c682fb9f73f',
                name: '3 anillos de control',
                description: '',
                type: 'null',
                inout: 'inout',
                enabled: 1,
                deleted: 0,
              },
            },
          ],
          groups: [],
          vehicles: [
            {
              id: '8949d002-fdea-423f-90d2-568e3556d106',
              rule_id: '4327b071-283e-4330-860d-3c682fb9f73f',
              vehicle_id: '90b92b1e-fb81-493e-81a0-9c2cd1d34c0e',
            },
          ],
          notifications: [
            {
              id: 'd8f22bbe-2716-402b-b7cc-d5bb43dbaa26',
              rule_id: '4327b071-283e-4330-860d-3c682fb9f73f',
              channel_id: '3246cd72-beb9-4946-b572-06c50c57a08d',
              channel_data:
                '[[{"field":"toList","splitArray":",","description":"A","type":"email","default":"","value":"arnaldo.munoz@kernotec.com"},{"field":"subject","description":"Titulo","type":"text","default":"","value":"Paso un punto de Control  "},{"field":"message","description":"Mensaje","type":"text","default":"","value":"Paso un punto de Control  "}]]',
            },
            {
              id: 'd89b53c3-709f-448a-8904-6e701176c7d9',
              rule_id: '4327b071-283e-4330-860d-3c682fb9f73f',
              channel_id: 'a034a711-13bb-44d5-b4cd-ef718d56071f',
              channel_data:
                '[[{"field":"toList","splitArray":",","description":"Teféfono","type":"number","default":"+591","value":"59160174745"},{"field":"message","description":"Mensaje","type":"text","default":"*:rule.name*\\n\\nEvento del vehículo :vehicle.name\\n\\n:rule.inout :rule.type :geofence.name:point.name\\n:devent.name :devent.operator :devent.condition\\n\\nhttps://www.google.com/maps?q=:device.lat,:device.lon\\n","value":"*:rule.name*\\n\\nEvento del vehículo :vehicle.name\\n\\n:rule.inout :rule.type :geofence.name:point.name\\n:devent.name :devent.operator :devent.condition\\n\\nhttps://www.google.com/maps?q=:device.lat,:device.lon\\n"}]]',
            },
          ],
          geofences: [
            {
              id: 'f05ee2b0-2bf5-4b84-bb7c-372c02aa5f64',
              rule_id: '4327b071-283e-4330-860d-3c682fb9f73f',
              geofence_id: '63fb4d96-3e4b-4045-aa6d-65cd1d5e76eb',
              inout: 'inout',
            },
            {
              id: '65622307-0f40-4e27-ab73-3a9088aa12dd',
              rule_id: '4327b071-283e-4330-860d-3c682fb9f73f',
              geofence_id: 'e4a8b46e-7ae3-42d8-be95-fe2372f2da64',
              inout: 'inout',
            },
            {
              id: '904fd5a5-99c3-46f1-80ff-1dc0e8fabad2',
              rule_id: '4327b071-283e-4330-860d-3c682fb9f73f',
              geofence_id: '4470aead-4f16-459f-a8ff-e98045dd1d4a',
              inout: 'inout',
            },
          ],
          ipoints: [],
        },
      ],
      pagination: {
        pages: 0,
        rowsNumber: 2,
      },
    }),
  );
