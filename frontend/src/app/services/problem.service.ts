import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { ProblemModel } from '../../../../common/src/models/problem.model';
import {
  ClientProblemSubmission,
  ClientReplayRequest
} from '../../../../common/src/problem-submission';
import {DivisionModel} from "../../../../common/src/models/division.model";
import {DivisionService} from "./division.service";
import {GroupedEntityService} from "./entity.service";
import {ProblemUtil} from "../../../../common/src/utils/problem.util";
import {EditProblemComponent} from "../admin/components/edit-problem/edit-problem.component";

@Injectable({
  providedIn: 'root'
})
export class ProblemService implements GroupedEntityService {
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

  constructor(private restService: RestService, private divisionService: DivisionService) { }

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

  columns = ['number', {name: 'title', isEditColumn: true}];
  editComponent = EditProblemComponent;
  title = 'Problems';
  type = 'grouped' as const;

  getGroupLabel(entity: DivisionModel): string {
    return entity.name;
  }

  getParents(): Promise<DivisionModel[]> {
    return this.divisionService.getAll();
  }

  getChildren(parent: DivisionModel): Promise<ProblemModel[]> {
    return this.getProblems(parent._id.toString());
  }

  getData(column: string, value: ProblemModel, parent: DivisionModel): any | undefined {
    if (column === 'number') {
      return ProblemUtil.getProblemNumberForDivision(value, parent);
    }
  }
}
