import { Component, Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Title } from '@angular/platform-browser';
import { NgbModal, NgbActiveModal, NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators } from '@angular/forms';
import { FieldType } from './models/field-type.model';
import { FieldTypeProperty } from './models/field-type-property.model';

import { DataService } from './services/data-service.abstract';
import { PageTableAbstractComponent, ModalContentAbstractComponent } from './page-table.abstract';

@Injectable()
export class FieldTypesService extends DataService {

    constructor(http: Http) {
        super(http);
        this.setRequestUrl('admin/field_types');
    }

    extractData(res: Response): any {
        let body = res.json();
        if(body.data){
            if(Array.isArray(body.data)){
                body.data = body.data as FieldType[];
            } else {
                body.data = body.data as FieldType;
            }
        }
        return body;
    }
}

@Component({
    selector: 'field-type-modal-content',
    templateUrl: 'templates/modal_field_type.html',
    providers: [ FieldTypesService ]
})
export class FieldTypeModalContent extends ModalContentAbstractComponent {

    data: FieldType;

    formFields = {
        name: {
            value: '',
            validators: [Validators.required, Validators.pattern('[A-Za-z0-9_-]+')],
            messages: {
                required: 'Name is required.',
                pattern: 'The name must contain only Latin letters and numbers.'
            }
        },
        title: {
            value: '',
            validators: [Validators.required],
            messages: {
                required: 'Title is required.'
            }
        },
        description: {
            value: '',
            validators: [],
            messages: {}
        }
    };

    constructor(
        fb: FormBuilder,
        dataService: FieldTypesService,
        activeModal: NgbActiveModal,
        tooltipConfig: NgbTooltipConfig
    ) {
        super(fb, dataService, activeModal, tooltipConfig);
    }

    addRow(type: string){
        if(!this.data[type]){
            this.data[type] = [];
        }
        this.data[type].push(new FieldTypeProperty('','',''));
    }

    deleteRow(index: number, type: string){
        if(this.data[type].length < index + 1){
            return;
        }
        this.data[type].splice(index, 1);
    }

    save(){
        this.submitted = true;
        if(!this.form.valid){
            this.onValueChanged(this.form.value);
            this.submitted = false;
        }
        else {

            let callback = function(res: any){
                if(res.success){
                    this.closeModal();
                } else {
                    if(res.msg){
                        this.submitted = false;
                        this.errorMessage = res.msg;
                    }
                }
            };

            if(this.data.id){
                this.dataService.update(this.data).then(callback.bind(this));
            } else {
                this.dataService.create(this.data).then(callback.bind(this));
            }
        }
    }

}

@Component({
    selector: 'shk-field-types',
    templateUrl: 'templates/page-field_types.html',
    providers: [ FieldTypesService ]
})
export class FieldTypesComponent extends PageTableAbstractComponent {
    title: string = 'Field types';

    constructor(
        dataService: FieldTypesService,
        activeModal: NgbActiveModal,
        modalService: NgbModal,
        titleService: Title
    ) {
        super(dataService, activeModal, modalService, titleService);
    }

    tableFields = [
        {
            name: 'name',
            title: 'Системное имя',
            output_type: 'text'
        },
        {
            name: 'title',
            title: 'Название',
            output_type: 'text'
        }
    ];

    getModalContent(){
        return FieldTypeModalContent;
    }

}
