import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import {
  ProblemDivision,
  ProblemModel,
  ProblemType,
  TestCaseOutputMode
} from '../../../../common/src/models/problem.model';
import {
  ClientProblemSubmission,
  ClientReplayRequest
} from '../../../../common/src/problem-submission';
import {DivisionModel} from "../../../../common/src/models/division.model";
import {DivisionService} from "./division.service";
import {Column, GroupedEntityService} from "./entity.service";
import {ProblemUtil} from "../../../../common/src/utils/problem.util";

@Injectable({
  providedIn: 'root'
})
export class ProblemService extends GroupedEntityService<ProblemModel, DivisionModel> {
  private endpoint = 'problems';

  // This holds a ClientProblemSubmission from problem.component and gives it to submit.component.
  private _problemSubmission: ClientProblemSubmission;

  // This holds a ClientReplayRequest from submission.component and gives it to submit.component.
  private _replayRequest: ClientReplayRequest;

  get problemSubmission() {
    const temp = this._problemSubmission;
    this._problemSubmission = undefined;
    return temp;
  }

  get peekProblemSubmission() {
    return this._problemSubmission;
  }

  set problemSubmission(value: ClientProblemSubmission) {
    this._problemSubmission = value;
  }

  get replayRequest() {
    const temp = this._replayRequest;
    this._replayRequest = undefined;
    return temp;
  }

  get peekReplayRequest() {
    return this._problemSubmission;
  }

  set replayRequest(value: ClientReplayRequest) {
    this._replayRequest = value;
  }

  constructor(private restService: RestService, private divisionService: DivisionService) {
    super({
      entityName: 'problem',
      columns: [
        {name: 'number'},
        {name: 'title', isEditColumn: true},
      ],
      attributes: [
        {name: '_id', optional: true, readonly: true},
        {name: 'title'},
        {name: 'description', type: 'wysiwyg'},
        {name: 'type', type: 'select', options: Object.keys(ProblemType).map(type => ProblemType[type])},
        {name: 'divisions', type: 'table', columns: [
          {name: 'division', type: 'select', options: () => this.divisionService.getAll().then(divisions => divisions.map(division => ({name: division.name, value: division._id.toString()}))), transform: (value?: Partial<ProblemDivision>) => value?.division?._id},
          {name: 'problemNumber'},
          {name: 'points'},
        ]},
        // TODO: Support open-ended questions. Should just have a drop-down with options as Game enum values.
        {name: 'testCases', type: 'table', columns: [
          {name: 'input', type: 'multiline'},
          {name: 'output', type: 'multiline'},
          {name: 'hidden', type: 'boolean', optional: true}
        ]},
        {name: 'testCaseOutputMode', type: 'select', options: Object.keys(TestCaseOutputMode).map(mode => TestCaseOutputMode[mode])},
      ],
      editable: true,
    });
  }

  getProblem(id: string): Promise<ProblemModel> {
    return this.restService.get<ProblemModel>(`${this.endpoint}/${id}`);
  }

  getProblems(divisionId: string): Promise<ProblemModel[]> {
    return this.restService.get<ProblemModel[]>(`${this.endpoint}/division/${divisionId}`);
  }

  addOrUpdate(problem: any): Promise<ProblemModel> {
    // problem should be a ProblemModel but division is a string[] rather than a DivisionModel[].
    return this.restService.put<ProblemModel>(this.endpoint, problem);
  }

  delete(problem: ProblemModel): Promise<void> {
    return this.restService.delete<void>(`${this.endpoint}/${problem._id}`);
  }

  // SECTION: GroupedEntityService

  getParents(): Promise<DivisionModel[]> {
    return this.divisionService.getAll();
  }

  getChildren(parent: DivisionModel): Promise<ProblemModel[]> {
    return this.getProblems(parent._id.toString());
  }

  getData(column: Column, value: ProblemModel, parent: DivisionModel): any | undefined {
    if (column.name === 'number') {
      return ProblemUtil.getProblemNumberForDivision(value, parent);
    }
  }

  getGroupLabel(parent: DivisionModel): string {
    return parent.name;
  }

  getName(entity: ProblemModel) {
    return entity.title;
  }
}
