<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar flat color="white">

          <v-btn color="primary" dark class="mr-4" @click="dialog = true">Agregar</v-btn>

          <v-btn outlined class="mr-4" @click="setToday">
            Hoy
          </v-btn>
          <v-btn fab text small @click="prev">
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn fab text small @click="next">
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>
          <v-toolbar-title>{{ title }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom right>
            <template v-slot:activator="{ on }">
              <v-btn
                outlined
                v-on="on"
              >
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Día</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Semana</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Mes</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-title>4 días</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-sheet>
      <v-sheet height="600">

        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          :events="events"
          :event-color="getEventColor"
          :event-margin-bottom="3"
          :now="today"
          :type="type"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="viewDay"
          @change="updateRange"
          :weekdays="[1, 2, 3, 4, 5, 6, 0]"
          locale="es"
          :short-weekdays="true"
        ></v-calendar>
        <!-- Agregar evento -->
        <v-dialog v-model="dialog">
          <v-card>
            <v-container>
              <v-form @submit.prevent="addEvent">
                <v-text-field type="text" label="agregar nombre" v-model="name"></v-text-field>
                <v-text-field type="text" label="agregar detalle" v-model="details"></v-text-field>
                <v-text-field type="date" label="agregar fecha inicial" v-model="start"></v-text-field>
                <v-text-field type="date" label="agregar fecha final" v-model="end"></v-text-field>
                <v-text-field type="color" label="Elige color del evento" v-model="color"></v-text-field>
                <v-btn type="submit" color="primary" class="mr-4" @click="dialog=false">Agregar</v-btn>
              </v-form>
            </v-container>
          </v-card>
        </v-dialog>

        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
        >
          <v-card
            color="grey lighten-4"
            min-width="350px"
            flat
          >
            
            <v-toolbar
              :color="selectedEvent.color"
              dark
            >
            <!-- Eliminar nota -->
              <v-btn icon @click="deleteEvent(selectedEvent)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>


            <!--Editar nota-->
            <v-card-text>
              <v-form text v-if="currentlyEditing !== selectedEvent.id">
                <h4>{{selectedEvent.name}} </h4> 
                {{selectedEvent.details}}
              </v-form>
              <v-form v-else>
                <v-text-field type="text" v-model="selectedEvent.name" label="Editar nombre">
                </v-text-field>

                <textarea-autosize type="text" v-model="selectedEvent.details"
                style="100%" :min-height="100">

                </textarea-autosize>
              </v-form>

            </v-card-text>


            <v-card-actions>
              <v-btn
                text
                color="secondary"
                @click="selectedOpen = false"
              >
                Cerrar
              </v-btn>
              <v-btn text v-if="currentlyEditing !== selectedEvent.id"
              @click.prevent="editEvent(selectedEvent.id)">Editar</v-btn>

              <v-btn text v-else @click="updateEvent(selectedEvent)">Guardar cambios</v-btn>

            </v-card-actions>
          </v-card>
        </v-menu>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script>

  import {db} from '../main';

  export default {
    data: () => ({
      today: new Date().toISOString().substr(0, 10),
      focus: new Date().toISOString().substr(0, 10),
      type: 'month',
      typeToLabel: {
        month: 'Mes',
        week: 'Semana',
        day: 'Dia',
        '4day': '4 dias',
      },
      start: null,
      end: null,
      selectedEvent: {},
      selectedElement: null,
      selectedOpen: false,
      events: [],
      name: null,
      details: null,
      color: '#1976D2',
      dialog: false,
      currentlyEditing: null
    }),
    computed: {
      title () {
        const { start, end } = this
        if (!start || !end) {
          return ''
        }

        const startMonth = this.monthFormatter(start)
        const endMonth = this.monthFormatter(end)
        const suffixMonth = startMonth === endMonth ? '' : endMonth

        const startYear = start.year
        const endYear = end.year
        const suffixYear = startYear === endYear ? '' : endYear

        const startDay = start.day + this.nth(start.day)
        const endDay = end.day + this.nth(end.day)

        switch (this.type) {
          case 'month':
            return `${startMonth} ${startYear}`
          case 'week':
          case '4day':
            return `${startMonth} ${startDay} ${startYear} - ${suffixMonth} ${endDay} ${suffixYear}`
          case 'day':
            return `${startMonth} ${startDay} ${startYear}`
        }
        return ''
      },
      monthFormatter () {
        return this.$refs.calendar.getFormatter({
          timeZone: 'UTC', month: 'long',
        })
      },
    },
    mounted () {
      this.$refs.calendar.checkChange();
      
    },
    created(){
      this.getEvent();
    },
    methods: {
      //Llamado a evento editar
      async updateEvent(ev){
        try {
          await db.collection('eventos').doc(ev.id).update({
            name: ev.name,
            details:ev.details
          })
          this.selectedOpen = false; //cerrar ventana
          this.currentlyEditing = null; //restaurar datos de edicion
        } catch (error) {
          console.log(error)
        }
      },
      editEvent(ev){
        this.currentlyEditing = ev;
      },
      //Llamado a evento borrar
      async deleteEvent(ev){ 
        try {
          await db.collection('eventos').doc(ev.id).delete();
          this.selectedOpen=false; //cerrar ventana modal
          this.getEvent(); //llamar evento para no refrescar ventana
        } catch (error) {
          console.log(error)
          
        }
      },
      //Agregar nueva nota
      async addEvent(){
        try {
          if(this.start && this.end && this.name){
            console.log(this.start, this.end)
            await db.collection('eventos').add({
              name:this.name,
              details:this.details,
              start:this.start,
              end:this.end,
              color:this.color,
              
            })
            //Llamado y restauraación de datos del evento
            this.getEvent();
            
            this.name=null;
            this.details=null;
            this.start=null;
            this.end=null;
            this.color='#1976D2';
          }else{
            console.log('Campos obligatorios')
          }
        } catch (error) {
          console.log="error";
        }

      },
       
      async getEvent(){
        try {
          const snapshot = await db.collection('eventos').get();
          const events = [];
          snapshot.forEach(doc => {
            let eventoData = doc.data();
            eventoData.id = doc.id;
            events.push(eventoData);
          })
          this.events = events;
        }
        catch(error){
          console.log(error);

        }
      },

      viewDay ({ date }) {
        this.focus = date
        this.type = 'day'
      },
      getEventColor (event) {
        return event.color
      },
      setToday () {
        this.focus = this.today
      },
      prev () {
        this.$refs.calendar.prev()
      },
      next () {
        this.$refs.calendar.next()
      },
      showEvent ({ nativeEvent, event }) {
        const open = () => {
          this.selectedEvent = event
          this.selectedElement = nativeEvent.target
          setTimeout(() => this.selectedOpen = true, 10)
        }

        if (this.selectedOpen) {
          this.selectedOpen = false
          setTimeout(open, 10)
        } else {
          open()
        }

        nativeEvent.stopPropagation()
      },
      updateRange ({ start, end }) {
        
        this.start = start
        this.end = end
      },
      nth (d) {
        return d > 3 && d < 21
          ? 'th'
          : ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][d % 10]
      },
    },
  }
</script>
