import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {NgbModule, NgbActiveModal, NgbTooltipConfig} from '@ng-bootstrap/ng-bootstrap';
import {EditorModule, CalendarModule, ChipsModule, ColorPickerModule, TreeModule} from 'primeng/primeng';
import {TranslateModule} from '@ngx-translate/core';

import {TableComponent} from './table.component';
import {InputFieldRenderComponent} from './render-input-field';
import {OutputFieldComponent} from './render-output-field';

import {FilterFieldByGroupPipe} from './pipes/filter-field-by-group.pipe';
import {DateFromObjectPipe} from './pipes/date-from-object.pipe';
import {UserRoleColorPipe, UserRoleNamePipe} from './pipes/user-role.pipe';
import {OrderByPipe} from './pipes/orderby.pipe';
import {FilterArrayPipe} from './pipes/filter-array-pipe';

const components = [
    TableComponent,
    InputFieldRenderComponent,
    OutputFieldComponent
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        EditorModule,
        CalendarModule,
        ChipsModule,
        ColorPickerModule,
        TreeModule,
        NgbModule.forRoot(),
        TranslateModule,
    ],
    declarations: [
        ...components,
        FilterFieldByGroupPipe,
        DateFromObjectPipe,
        UserRoleNamePipe,
        UserRoleColorPipe,
        OrderByPipe,
        FilterArrayPipe,
    ],
    providers: [
        NgbActiveModal,
        NgbTooltipConfig
    ],
    exports: [
        ...components,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        EditorModule,
        CalendarModule,
        ChipsModule,
        ColorPickerModule,
        TreeModule,
        TranslateModule,
        DateFromObjectPipe
    ]
})
export class SharedModule {
}