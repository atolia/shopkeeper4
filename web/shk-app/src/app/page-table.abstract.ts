import {OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbActiveModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {QueryOptions} from './models/query-options';
import {AlertModalContent, ConfirmModalContent} from './app.component';

import {DataService} from './services/data-service.abstract';

export abstract class PageTableAbstractComponent<M> implements OnInit {
    errorMessage: string;
    items: M[] = [];
    title = 'Page with data table';
    modalRef: NgbModalRef;
    loading = false;
    selectedIds: number[] = [];
    collectionSize = 0;
    queryOptions: QueryOptions = new QueryOptions('name', 'asc', 1, 10, 0, 0);
    @ViewChild('table') table;

    abstract getModalContent();

    constructor(
        public dataService: DataService<any>,
        public activeModal: NgbActiveModal,
        public modalService: NgbModal
    ) {

    }

    ngOnInit(): void {
        this.getList();
    }

    modalOpen(itemId?: number, isItemCopy: boolean = false): void {
        this.modalRef = this.modalService.open(this.getModalContent(), {size: 'lg', backdrop: 'static'});
        this.setModalInputs(itemId, isItemCopy);
        this.modalRef.result.then((result) => {
            this.getList();
        }, (reason) => {
            // console.log( 'reason', reason );
        });
    }

    setModalInputs(itemId?: number, isItemCopy: boolean = false): void {
        const isEditMode = typeof itemId !== 'undefined' && !isItemCopy;
        this.modalRef.componentInstance.modalTitle = isEditMode ? 'Edit' : 'Add';
        this.modalRef.componentInstance.itemId = itemId || 0;
        this.modalRef.componentInstance.isItemCopy = isItemCopy || false;
        this.modalRef.componentInstance.isEditMode = isEditMode;
    }

    deleteItemConfirm(itemId: number): void {
        this.modalRef = this.modalService.open(ConfirmModalContent);
        this.modalRef.componentInstance.modalTitle = 'Confirm';
        this.modalRef.componentInstance.modalContent = 'Are you sure you want to remove this item?';
        this.modalRef.result.then((result) => {
            if (result === 'accept') {
                this.deleteItem(itemId);
            }
        });
    }

    confirmAction(message: string) {
        this.modalRef = this.modalService.open(ConfirmModalContent);
        this.modalRef.componentInstance.modalTitle = 'Confirm';
        this.modalRef.componentInstance.modalContent = message;
        return this.modalRef.result;
    }

    blockSelected() {
        if (this.selectedIds.length === 0) {
            this.showAlert('Nothing is selected.');
            return;
        }
        this.dataService.actionBatch(this.selectedIds, 'block')
            .subscribe(res => {
                    this.clearSelected();
                    this.getList();
                },
                err => this.showAlert(err.error || 'Error'));
    }

    deleteSelected() {
        if (this.selectedIds.length === 0) {
            this.showAlert('Nothing is selected.');
            return;
        }
        this.confirmAction('Are you sure you want to delete all selected items?')
            .then((result) => {
                if (result === 'accept') {
                    this.dataService.actionBatch(this.selectedIds, 'delete')
                        .subscribe(res => {
                            this.clearSelected();
                            this.getList();
                        },
                            err => this.showAlert(err.error || 'Error'));
                }
            });
    }

    showAlert(message: string) {
        this.modalRef = this.modalService.open(AlertModalContent);
        this.modalRef.componentInstance.modalContent = message;
        this.modalRef.componentInstance.modalTitle = 'Error';
        this.modalRef.componentInstance.messageType = 'error';
    }

    deleteItem(itemId: number): void {
        this.confirmAction('Are you sure you want to remove this item?')
            .then((result) => {
                if (result === 'accept') {
                    this.dataService.deleteItem(itemId)
                        .subscribe((res) => {
                            this.getList();
                        }, err => {
                            this.showAlert(err);
                        });
                }
            });
    }

    clearSelected(): void {
        if (this.table) {
            this.table.clearSelected();
        }
    }

    actionRequest(actionValue: [string, number]): void {
        switch (actionValue[0]) {
            case 'edit':
                this.modalOpen(actionValue[1]);
                break;
            case 'copy':
                this.modalOpen(actionValue[1], true);
                break;
            case 'delete':
                this.deleteItem(actionValue[1]);
                break;
            case 'changeQuery':
                this.getList();
                break;
        }
    }

    getList(): void {
        this.loading = true;
        this.dataService.getListPage(this.queryOptions)
            .subscribe(
                data => {
                    this.items = data.items;
                    this.collectionSize = data.total;
                    this.loading = false;
                },
                error => this.errorMessage = error
            );
    }

}
